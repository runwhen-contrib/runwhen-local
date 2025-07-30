import { getEndpointPlugin } from "@smithy/middleware-endpoint";
import { getSerdePlugin } from "@smithy/middleware-serde";
import { Command as $Command } from "@smithy/smithy-client";
import { commonParams } from "../endpoint/EndpointParameters";
import { de_AcceptVpcEndpointConnectionsCommand, se_AcceptVpcEndpointConnectionsCommand } from "../protocols/Aws_ec2";
export { $Command };
export class AcceptVpcEndpointConnectionsCommand extends $Command
    .classBuilder()
    .ep(commonParams)
    .m(function (Command, cs, config, o) {
    return [
        getSerdePlugin(config, this.serialize, this.deserialize),
        getEndpointPlugin(config, Command.getEndpointParameterInstructions()),
    ];
})
    .s("AmazonEC2", "AcceptVpcEndpointConnections", {})
    .n("EC2Client", "AcceptVpcEndpointConnectionsCommand")
    .f(void 0, void 0)
    .ser(se_AcceptVpcEndpointConnectionsCommand)
    .de(de_AcceptVpcEndpointConnectionsCommand)
    .build() {
}
