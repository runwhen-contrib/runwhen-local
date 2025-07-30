import { getEndpointPlugin } from "@smithy/middleware-endpoint";
import { getSerdePlugin } from "@smithy/middleware-serde";
import { Command as $Command } from "@smithy/smithy-client";
import { commonParams } from "../endpoint/EndpointParameters";
import { de_ModifyPrivateDnsNameOptionsCommand, se_ModifyPrivateDnsNameOptionsCommand } from "../protocols/Aws_ec2";
export { $Command };
export class ModifyPrivateDnsNameOptionsCommand extends $Command
    .classBuilder()
    .ep(commonParams)
    .m(function (Command, cs, config, o) {
    return [
        getSerdePlugin(config, this.serialize, this.deserialize),
        getEndpointPlugin(config, Command.getEndpointParameterInstructions()),
    ];
})
    .s("AmazonEC2", "ModifyPrivateDnsNameOptions", {})
    .n("EC2Client", "ModifyPrivateDnsNameOptionsCommand")
    .f(void 0, void 0)
    .ser(se_ModifyPrivateDnsNameOptionsCommand)
    .de(de_ModifyPrivateDnsNameOptionsCommand)
    .build() {
}
