module.exports = ({ env }) => ({
  auth: {
    secret: env("ADMIN_JWT_SECRET"),
  },
  apiToken: {
    salt: env("API_TOKEN_SALT"),
  },
  url: env("STRAPI_ADMIN_URL"),
  admin: {
    auth: {
      providers: [
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
  },
});
