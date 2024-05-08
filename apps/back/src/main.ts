import "dotenv/config";
import { MathAgency } from "./maths-agency";

const agency = new MathAgency();

const run = async () => {
  try {
    await agency.run();
    await agency.initApi(3001);
  } catch (err) {
    console.error(err);
  }
};
run();
