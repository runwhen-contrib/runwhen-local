import { createPaginator } from "@smithy/core";
import { GetSpotPlacementScoresCommand, } from "../commands/GetSpotPlacementScoresCommand";
import { EC2Client } from "../EC2Client";
export const paginateGetSpotPlacementScores = createPaginator(EC2Client, GetSpotPlacementScoresCommand, "NextToken", "NextToken", "MaxResults");
