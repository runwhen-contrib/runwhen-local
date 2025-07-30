import { WaiterConfiguration, WaiterResult } from "@smithy/util-waiter";
import { DescribeVolumesCommandInput } from "../commands/DescribeVolumesCommand";
import { EC2Client } from "../EC2Client";
/**
 *
 *  @deprecated Use waitUntilVolumeInUse instead. waitForVolumeInUse does not throw error in non-success cases.
 */
export declare const waitForVolumeInUse: (params: WaiterConfiguration<EC2Client>, input: DescribeVolumesCommandInput) => Promise<WaiterResult>;
/**
 *
 *  @param params - Waiter configuration options.
 *  @param input - The input to DescribeVolumesCommand for polling.
 */
export declare const waitUntilVolumeInUse: (params: WaiterConfiguration<EC2Client>, input: DescribeVolumesCommandInput) => Promise<WaiterResult>;
