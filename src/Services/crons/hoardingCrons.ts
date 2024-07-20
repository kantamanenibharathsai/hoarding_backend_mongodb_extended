import { CronJob } from "cron";
import { enableHoardingHandler, removeBookedHoardings } from "./cronHandler";
export const enableHoardingCron = CronJob.from({
  cronTime: "0 0 0 * * *",
  onTick: enableHoardingHandler,
  start: true,
});

export const enableRemoveBookedCrons = CronJob.from({
  cronTime: "0 0 0 * * *",
  onTick: enableHoardingHandler,
  start: true,
});
