import { Paginator } from "@smithy/types";
import {
  GetTransitGatewayMulticastDomainAssociationsCommandInput,
  GetTransitGatewayMulticastDomainAssociationsCommandOutput,
} from "../commands/GetTransitGatewayMulticastDomainAssociationsCommand";
import { EC2PaginationConfiguration } from "./Interfaces";
export declare const paginateGetTransitGatewayMulticastDomainAssociations: (
  config: EC2PaginationConfiguration,
  input: GetTransitGatewayMulticastDomainAssociationsCommandInput,
  ...rest: any[]
) => Paginator<GetTransitGatewayMulticastDomainAssociationsCommandOutput>;
