import { Inject, Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy } from "passport-google-oauth20";

import type { GoogleProfileData } from "./auth.types.js";

type GoogleProfile = {
  id: string;
  displayName: string;
  emails?: Array<{ value: string }>;
  photos?: Array<{ value: string }>;
};

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, "google") {
  constructor(@Inject(ConfigService) config: ConfigService) {
    super({
      clientID: config.get<string>("GOOGLE_CLIENT_ID") || "not-configured",
      clientSecret:
        config.get<string>("GOOGLE_CLIENT_SECRET") || "not-configured",
      callbackURL:
        config.get<string>("GOOGLE_CALLBACK_URL") ||
        "http://localhost:3001/auth/google/callback",
      scope: ["openid", "email", "profile"],
    });
  }

  validate(_: string, __: string, profile: GoogleProfile): GoogleProfileData {
    const email = profile.emails?.[0]?.value;
    if (!email)
      throw new Error("Google não retornou um e-mail para esta conta.");

    return {
      googleId: profile.id,
      email,
      displayName: profile.displayName,
      avatarUrl: profile.photos?.[0]?.value ?? null,
    };
  }
}
