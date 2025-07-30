import { createPaginator } from "@smithy/core";
import { DescribeTrunkInterfaceAssociationsCommand, } from "../commands/DescribeTrunkInterfaceAssociationsCommand";
import { EC2Client } from "../EC2Client";
export const paginateDescribeTrunkInterfaceAssociations = createPaginator(EC2Client, DescribeTrunkInterfaceAssociationsCommand, "NextToken", "NextToken", "MaxResults");
