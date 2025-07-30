import { getEndpointPlugin } from "@smithy/middleware-endpoint";
import { getSerdePlugin } from "@smithy/middleware-serde";
import { Command as $Command } from "@smithy/smithy-client";
import { commonParams } from "../endpoint/EndpointParameters";
import { DescribeVpnConnectionsResultFilterSensitiveLog, } from "../models/models_5";
import { de_DescribeVpnConnectionsCommand, se_DescribeVpnConnectionsCommand } from "../protocols/Aws_ec2";
export { $Command };
export class DescribeVpnConnectionsCommand extends $Command
    .classBuilder()
    .ep(commonParams)
    .m(function (Command, cs, config, o) {
    return [
        getSerdePlugin(config, this.serialize, this.deserialize),
        getEndpointPlugin(config, Command.getEndpointParameterInstructions()),
    ];
})
    .s("AmazonEC2", "DescribeVpnConnections", {})
    .n("EC2Client", "DescribeVpnConnectionsCommand")
    .f(void 0, DescribeVpnConnectionsResultFilterSensitiveLog)
    .ser(se_DescribeVpnConnectionsCommand)
    .de(de_DescribeVpnConnectionsCommand)
    .build() {
}
