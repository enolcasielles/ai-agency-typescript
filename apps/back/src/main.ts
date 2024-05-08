import "dotenv/config";
import { DemoAgency } from "./demo-agency";

const agency = new DemoAgency();

const run = async () => {
  try {
    await agency.run();
    await agency.initApi(3001);
  } catch (err) {
    console.error(err);
  }
};
run();
