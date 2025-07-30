import { WaiterConfiguration, WaiterResult } from "@smithy/util-waiter";
import { DescribeVolumesCommandInput } from "../commands/DescribeVolumesCommand";
import { EC2Client } from "../EC2Client";
export declare const waitForVolumeAvailable: (
  params: WaiterConfiguration<EC2Client>,
  input: DescribeVolumesCommandInput
) => Promise<WaiterResult>;
export declare const waitUntilVolumeAvailable: (
  params: WaiterConfiguration<EC2Client>,
  input: DescribeVolumesCommandInput
) => Promise<WaiterResult>;
