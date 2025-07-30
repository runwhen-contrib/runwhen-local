import { Paginator } from "@smithy/types";
import {
  SearchLocalGatewayRoutesCommandInput,
  SearchLocalGatewayRoutesCommandOutput,
} from "../commands/SearchLocalGatewayRoutesCommand";
import { EC2PaginationConfiguration } from "./Interfaces";
export declare const paginateSearchLocalGatewayRoutes: (
  config: EC2PaginationConfiguration,
  input: SearchLocalGatewayRoutesCommandInput,
  ...rest: any[]
) => Paginator<SearchLocalGatewayRoutesCommandOutput>;
