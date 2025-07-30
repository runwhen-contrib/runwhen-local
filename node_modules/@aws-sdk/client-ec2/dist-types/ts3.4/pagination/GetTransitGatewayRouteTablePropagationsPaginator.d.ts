import { Paginator } from "@smithy/types";
import {
  GetTransitGatewayRouteTablePropagationsCommandInput,
  GetTransitGatewayRouteTablePropagationsCommandOutput,
} from "../commands/GetTransitGatewayRouteTablePropagationsCommand";
import { EC2PaginationConfiguration } from "./Interfaces";
export declare const paginateGetTransitGatewayRouteTablePropagations: (
  config: EC2PaginationConfiguration,
  input: GetTransitGatewayRouteTablePropagationsCommandInput,
  ...rest: any[]
) => Paginator<GetTransitGatewayRouteTablePropagationsCommandOutput>;
