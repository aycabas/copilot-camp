import { Project, HoursEntry, Assignment } from '../model/baseModel';
import { ApiProject } from '../model/apiModel';
import ProjectDbService from './ProjectDbService';
import AssignmentDbService from './AssignmentDbService';
import ConsultantDbService from './ConsultantDbService';
import ConsultantApiService from './ConsultantApiService';
import { HttpError } from '../utilities';

class ProjectApiService {

    async getApiProjectById(projectId: string): Promise<ApiProject> {
        const project = await ProjectDbService.getProjectById(projectId);
        let assignments = await AssignmentDbService.getAssignments();

        const result = await this.getApiProject(project, assignments);
        return result;
    }

    async getApiProjects(projectOrClientName: string, consultantName: string): Promise<ApiProject[]> {

        let projects = await ProjectDbService.getProjects();
        let assignments = await AssignmentDbService.getAssignments();

        // Filter on base properties
        if (projectOrClientName) {
            projects = projects.filter(
                (p) => {
                    const name = p.name?.toLowerCase();
                    const clientName = p.clientName?.toLowerCase();
                    return name.includes(projectOrClientName.toLowerCase()) || clientName.includes(projectOrClientName.toLowerCase());
                });
        }

        // Augment the base properties with assignment information
        let result = await Promise.all(projects.map((p) => this.getApiProject(p, assignments)));

        // Filter on augmented properties
        if (result && consultantName) {
            result = result.filter(
                (p) => {
                    const name = consultantName.toLowerCase();
                    return p.consultants.find((n) => n.consultantName.toLowerCase().includes(name));
                });
        };

        return result;
    }

    // Augment a project to get an ApiProject
    async getApiProject(project: Project, assignments: Assignment[]): Promise<ApiProject> {

        const result = project as ApiProject;
        result.clientLogoUrl = `http://via.placeholder.com/320x320`;
        assignments = assignments.filter((a) => a.projectId === project.id);

        result.consultants = [];
        result.forecastThisMonth = 0;
        result.forecastNextMonth = 0;
        result.deliveredLastMonth = 0;
        result.deliveredThisMonth = 0;

        const bingKey = process.env.BING_MAPS_KEY;
        const coord = `${result.location.latitude},${result.location.longitude}`;
        result.mapUrl = `https://dev.virtualearth.net/REST/v1/Imagery/Map/Road/?${coord}mapSize=450,600&pp=${coord}&key=${bingKey}`;

        for (let assignment of assignments) {
            const consultant = await ConsultantDbService.getConsultantById(assignment.consultantId);
            const { lastMonthHours: forecastLastMonth,
                thisMonthHours: forecastThisMonth,
                nextMonthHours: forecastNextMonth } = this.findHours(assignment.forecast);
            const { lastMonthHours: deliveredLastMonth,
                thisMonthHours: deliveredThisMonth,
                nextMonthHours: deliveredNextMonth } = this.findHours(assignment.delivered);

            result.consultants.push({
                consultantName: consultant.name,
                consultantLocation: consultant.location,
                role: assignment.role,
                forecastThisMonth: forecastThisMonth,
                forecastNextMonth: forecastNextMonth,
                deliveredLastMonth: deliveredLastMonth,
                deliveredThisMonth: deliveredThisMonth
            });

            result.forecastThisMonth += forecastThisMonth;
            result.forecastNextMonth += forecastNextMonth;
            result.deliveredLastMonth += deliveredLastMonth;
            result.deliveredThisMonth += deliveredThisMonth;

        }
        return result;
    }

    // Extract this and next month's hours from an array of HoursEntry
    private findHours(hours: HoursEntry[]): { lastMonthHours: number, thisMonthHours: number, nextMonthHours: number } {
        const now = new Date();
        const thisMonth = now.getMonth();
        const thisYear = now.getFullYear();

        const lastMonth = thisMonth === 0 ? 11 : thisMonth - 1;
        const lastYear = thisMonth === 0 ? thisYear - 1 : thisYear;

        const nextMonth = thisMonth === 11 ? 0 : thisMonth + 1;
        const nextYear = thisMonth === 11 ? thisYear + 1 : thisYear;

        const result = {
            lastMonthHours: hours.find((h) => h.month === lastMonth + 1 && h.year === lastYear)?.hours || 0,
            thisMonthHours: hours.find((h) => h.month === thisMonth + 1 && h.year === thisYear)?.hours || 0,
            nextMonthHours: hours.find((h) => h.month === nextMonth + 1 && h.year === nextYear)?.hours || 0
        };
        return result;
    }

    async addConsultantToProject(projectName: string, consultantName: string, role: string, hours: number): Promise<string> {
        let projects = await this.getApiProjects(projectName, "");
        let consultants = await ConsultantApiService.getApiConsultants(consultantName, "", "", "", "", "");

        if (projects.length === 0) {
            throw new HttpError(400, `Project not found: ${projectName}`);
        } else if (projects.length > 1) {
            throw new HttpError(400, `Multiple projects found with the name: ${projectName}`);
        } else if (consultants.length === 0) {
            throw new HttpError(400, `Consultant not found: ${consultantName}`);
        } else if (consultants.length > 1) {
            throw new HttpError(400, `Multiple consultants found with the name: ${consultantName}`);
        }
        const project = projects[0];
        const consultantId = consultants[0].id;

        // Always charge to the current month
        const remainingForecast = await AssignmentDbService.addConsultantToProject(project.id, consultantId, role, hours);
        return `Added consultant ${consultantId} to ${project.clientName} on project "${project.name}" with ${remainingForecast} hours forecast this month.`;

    }
}

export default new ProjectApiService();