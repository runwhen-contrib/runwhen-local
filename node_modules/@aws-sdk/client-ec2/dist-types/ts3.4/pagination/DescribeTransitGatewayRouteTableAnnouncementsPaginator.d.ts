import { Paginator } from "@smithy/types";
import {
  DescribeTransitGatewayRouteTableAnnouncementsCommandInput,
  DescribeTransitGatewayRouteTableAnnouncementsCommandOutput,
} from "../commands/DescribeTransitGatewayRouteTableAnnouncementsCommand";
import { EC2PaginationConfiguration } from "./Interfaces";
export declare const paginateDescribeTransitGatewayRouteTableAnnouncements: (
  config: EC2PaginationConfiguration,
  input: DescribeTransitGatewayRouteTableAnnouncementsCommandInput,
  ...rest: any[]
) => Paginator<DescribeTransitGatewayRouteTableAnnouncementsCommandOutput>;
