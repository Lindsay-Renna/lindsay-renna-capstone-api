import { knexUser } from "../knexfile.js";
import express from "express";
const router = express.Router();

router.use(express.json());

export default router;
