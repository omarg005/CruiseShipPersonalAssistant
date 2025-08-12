export const getDbDriver = () => process.env.DB_DRIVER || "json";

export const featureFlags = {
  enableSpa: process.env.FEATURE_SPA !== "off",
};

export const isDemo = () => (process.env.NODE_ENV !== "production" || process.env.DB_DRIVER === "json");

