import { Paginator } from "@smithy/types";
import {
  DescribeVpcEndpointConnectionNotificationsCommandInput,
  DescribeVpcEndpointConnectionNotificationsCommandOutput,
} from "../commands/DescribeVpcEndpointConnectionNotificationsCommand";
import { EC2PaginationConfiguration } from "./Interfaces";
export declare const paginateDescribeVpcEndpointConnectionNotifications: (
  config: EC2PaginationConfiguration,
  input: DescribeVpcEndpointConnectionNotificationsCommandInput,
  ...rest: any[]
) => Paginator<DescribeVpcEndpointConnectionNotificationsCommandOutput>;
