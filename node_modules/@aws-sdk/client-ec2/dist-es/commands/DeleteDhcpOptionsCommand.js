import { getEndpointPlugin } from "@smithy/middleware-endpoint";
import { getSerdePlugin } from "@smithy/middleware-serde";
import { Command as $Command } from "@smithy/smithy-client";
import { commonParams } from "../endpoint/EndpointParameters";
import { de_DeleteDhcpOptionsCommand, se_DeleteDhcpOptionsCommand } from "../protocols/Aws_ec2";
export { $Command };
export class DeleteDhcpOptionsCommand extends $Command
    .classBuilder()
    .ep(commonParams)
    .m(function (Command, cs, config, o) {
    return [
        getSerdePlugin(config, this.serialize, this.deserialize),
        getEndpointPlugin(config, Command.getEndpointParameterInstructions()),
    ];
})
    .s("AmazonEC2", "DeleteDhcpOptions", {})
    .n("EC2Client", "DeleteDhcpOptionsCommand")
    .f(void 0, void 0)
    .ser(se_DeleteDhcpOptionsCommand)
    .de(de_DeleteDhcpOptionsCommand)
    .build() {
}
