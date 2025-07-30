import { Paginator } from "@smithy/types";
import {
  DescribeClientVpnConnectionsCommandInput,
  DescribeClientVpnConnectionsCommandOutput,
} from "../commands/DescribeClientVpnConnectionsCommand";
import { EC2PaginationConfiguration } from "./Interfaces";
export declare const paginateDescribeClientVpnConnections: (
  config: EC2PaginationConfiguration,
  input: DescribeClientVpnConnectionsCommandInput,
  ...rest: any[]
) => Paginator<DescribeClientVpnConnectionsCommandOutput>;
