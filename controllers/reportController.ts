import { ReportDAO } from "../models/daos/ReportDAO"

export const getDailySales = async () => {

    const data = await ReportDAO.getDailySales()

    return data

}