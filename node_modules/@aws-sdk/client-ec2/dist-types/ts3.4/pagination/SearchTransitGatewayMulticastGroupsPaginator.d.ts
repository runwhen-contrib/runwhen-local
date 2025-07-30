import { Paginator } from "@smithy/types";
import {
  SearchTransitGatewayMulticastGroupsCommandInput,
  SearchTransitGatewayMulticastGroupsCommandOutput,
} from "../commands/SearchTransitGatewayMulticastGroupsCommand";
import { EC2PaginationConfiguration } from "./Interfaces";
export declare const paginateSearchTransitGatewayMulticastGroups: (
  config: EC2PaginationConfiguration,
  input: SearchTransitGatewayMulticastGroupsCommandInput,
  ...rest: any[]
) => Paginator<SearchTransitGatewayMulticastGroupsCommandOutput>;
