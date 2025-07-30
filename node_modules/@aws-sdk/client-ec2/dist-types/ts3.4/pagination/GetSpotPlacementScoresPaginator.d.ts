import { Paginator } from "@smithy/types";
import {
  GetSpotPlacementScoresCommandInput,
  GetSpotPlacementScoresCommandOutput,
} from "../commands/GetSpotPlacementScoresCommand";
import { EC2PaginationConfiguration } from "./Interfaces";
export declare const paginateGetSpotPlacementScores: (
  config: EC2PaginationConfiguration,
  input: GetSpotPlacementScoresCommandInput,
  ...rest: any[]
) => Paginator<GetSpotPlacementScoresCommandOutput>;
