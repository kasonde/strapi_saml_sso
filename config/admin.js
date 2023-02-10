const SamlStrategy = require("@node-saml/passport-saml").Strategy;
const fs = require("fs");
const jwt = require("jsonwebtoken");

module.exports = ({ env }) => ({
  auth: {
    secret: env("ADMIN_JWT_SECRET"),
    providers: [
      {
        uid: "azure_ad_oauth2",
        displayName: "Microsoft",
        icon: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/96/Microsoft_logo_%282012%29.svg/320px-Microsoft_logo_%282012%29.svg.png",
        createStrategy: (strapi) =>
          new AzureAdOAuth2Strategy(
            {
              clientID: env("MICROSOFT_CLIENT_ID", ""),
              clientSecret: env("MICROSOFT_CLIENT_SECRET", ""),
              scope: ["user:email"],
              tenant: env("MICROSOFT_TENANT_ID", ""),
              callbackURL:
                strapi.admin.services.passport.getStrategyCallbackURL(
                  "azure_ad_oauth2"
                ),
            },
            (accessToken, refreshToken, params, profile, done) => {
              let waadProfile = jwt.decode(params.id_token, "", true);
              done(null, {
                email: waadProfile.email,
                username: waadProfile.email,
                firstname: waadProfile.given_name, // optional if email and username exist
                lastname: waadProfile.family_name, // optional if email and username exist
              });
            }
          ),
      },
      {
        uid: "saml",
        displayName: "Okta",
        icon: "https://www.okta.com/sites/default/files/Okta_Logo_BrightBlue_Medium-thumbnail.png",
        createStrategy: (strapi) =>
          new SamlStrategy(
            {
              callbackURL:
                strapi.config.server.url +
                strapi.admin.services.passport.getStrategyCallbackURL("saml"),
              cert: fs.readFileSync(env("SAML_CERT_PATH"), "utf-8"),
              entryPoint: env("SAML_ENTRYPOINT_URL"),
              issuer: "passport-saml",
            },
            (accessToken, refreshToken, profile, done) => {
              done(null, {
                email: profile.email,
                username: profile.username,
              });
            }
          ),
      },
    ],
  },
  apiToken: {
    salt: env("API_TOKEN_SALT"),
  },
  url: env("STRAPI_ADMIN_URL"),
});
