const swaggerAutogen = require("swagger-autogen")();

const doc = {
  info: {
    version: "3.0.3",
    title: "Hoarding API",
    description: "Hoarding website documentation",
  },
  host: "localhost:8080",
  tags: [
    {
      name: "auth", // Tag name
      description: "something", // Tag description
    },
  ],
  schemes: ["http"],
};

const outputFile = "./swagger-output.tson";
const routes = [
  "./src/Routes/authRoutes.ts",
  "./src/Routes/bookingRoutes.ts",
  "./src/Routes/dashboardRoutes.ts",
  "./src/Routes/hoardingRoutes.ts",
  "./src/Routes/planRoutes.ts",
  "./src/Routes/sidebarRoutes.ts",
  "./src/Routes/ticketRoutes.ts",
  "./src/Routes/userRoutes.ts",
  "./src/Routes/languageRoutes.ts",
  "./src/Routes/privacyPolicyRoutes.ts",
  "./src/Routes/reviewRoutes.ts",
  "./src/Routes/notificationRoutes.ts",
  "./src/Routes/helpRoutes.ts",
  "./src/Routes/faqRoutes.ts",
  "./src/Routes/countryCodeRoutes.ts",
  "./src/Routes/categoryRoutes.ts",
  "./src/Routes/favoritesRoutes.ts",
  "./src/Routes/featureRoutes.ts",
];

swaggerAutogen(outputFile, routes, doc);
