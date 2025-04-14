import { Router } from "express";
import { getCategoryController, getEventController } from "../controllers/events.controller";

const router = Router();

router.get("/", getEventController);
router.get("/categories", getCategoryController); //tanya bisa nggak categories ini disatuin sama yang diatas jadi dalam satu route aja
// router.get("/events", getEventsByCategoryController);

export default router;

//terus kenapa harus /landings apakah karena service ada di dalam folder landing?
//terus cara penulisan yang enak buat landing page itu gimana?
