import { Paginator } from "@smithy/types";
import {
  GetTransitGatewayRouteTableAssociationsCommandInput,
  GetTransitGatewayRouteTableAssociationsCommandOutput,
} from "../commands/GetTransitGatewayRouteTableAssociationsCommand";
import { EC2PaginationConfiguration } from "./Interfaces";
export declare const paginateGetTransitGatewayRouteTableAssociations: (
  config: EC2PaginationConfiguration,
  input: GetTransitGatewayRouteTableAssociationsCommandInput,
  ...rest: any[]
) => Paginator<GetTransitGatewayRouteTableAssociationsCommandOutput>;
