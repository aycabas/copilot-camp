/* This code sample provides a starter kit to implement server side logic for your Teams App in TypeScript,
 * refer to https://docs.microsoft.com/en-us/azure/azure-functions/functions-reference for complete Azure Functions
 * developer guide.
 */

import { Context, HttpRequest } from "@azure/functions";
import repairRecords from "../repairsData.json";

import ConsultantService from "../services/ConsultantService";
import ProjectService from "../services/ProjectService";
import AssignmentService from "../services/AssignmentService";

// Define a Response interface.
interface Response {
  status: number;
  body: {
    results: any[];
  };
}

/**
 * This function handles the HTTP request and returns the repair information.
 *
 * @param {Context} context - The Azure Functions context object.
 * @param {HttpRequest} req - The HTTP request.
 * @returns {Promise<Response>} - A promise that resolves with the HTTP response containing the repair information.
 */
export default async function run(context: Context, req: HttpRequest): Promise<Response> {
  // Initialize response.
  const res: Response = {
    status: 200,
    body: {
      results: [],
    },
  };

  try {

    // Get the assignedTo query parameter.
    const assignedTo = req.query.assignedTo;

    // If the assignedTo query parameter is not provided, return the response.
    if (!assignedTo) {
      return res;
    }

    // *** TEST TEST TEST ***

    // const r = await ConsultantService.getConsultantById(assignedTo);
    // const r = await ProjectService.getProjectById(assignedTo);
    // const r = await ProjectService.getProjects(() => true);

    // Get assignments for consultant
    // const r = await AssignmentService.getAssignments((a) => a.consultantId === assignedTo);

    const r = await AssignmentService.chargeHoursToProject("11", "1", 3, 2024, 10);
    res.body.results = [r];
    return res;

    // // Filter the repair information by the assignedTo query parameter.
    // const repairs = repairRecords.filter((item) => {
    //   const fullName = item.assignedTo.toLowerCase();
    //   const query = assignedTo.trim().toLowerCase();
    //   const [firstName, lastName] = fullName.split(" ");
    //   return fullName === query || firstName === query || lastName === query;
    // });

    // // Return filtered repair records, or an empty array if no records were found.
    // res.body.results = repairs ?? [];
    // return res;
  } catch (error) {
    const status = error.status || error.response?.status || 500;
    console.log(`Returning error status code ${status.status}: ${error.message}`);

    res.status = status;
    res.body.results = [{
      status: status,
      error: error.message
     }];
    return res;
  }
}