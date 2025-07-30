import { createPaginator } from "@smithy/core";
import { GetInstanceTypesFromInstanceRequirementsCommand, } from "../commands/GetInstanceTypesFromInstanceRequirementsCommand";
import { EC2Client } from "../EC2Client";
export const paginateGetInstanceTypesFromInstanceRequirements = createPaginator(EC2Client, GetInstanceTypesFromInstanceRequirementsCommand, "NextToken", "NextToken", "MaxResults");
