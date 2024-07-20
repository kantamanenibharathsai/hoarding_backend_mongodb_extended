import { enableHoardingCron, enableRemoveBookedCrons } from "./hoardingCrons";

export default function startCrons() {
  console.log("starting cron jobs 🐱🐱🐱🐱🐱🐱");
  const crons = [enableHoardingCron, enableRemoveBookedCrons];
  crons.forEach((cron) => {
    cron.start();
  });
}
