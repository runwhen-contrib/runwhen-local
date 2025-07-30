import { getEndpointPlugin } from "@smithy/middleware-endpoint";
import { getSerdePlugin } from "@smithy/middleware-serde";
import { Command as $Command } from "@smithy/smithy-client";
import { commonParams } from "../endpoint/EndpointParameters";
import { de_DisassociateRouteTableCommand, se_DisassociateRouteTableCommand } from "../protocols/Aws_ec2";
export { $Command };
export class DisassociateRouteTableCommand extends $Command
    .classBuilder()
    .ep(commonParams)
    .m(function (Command, cs, config, o) {
    return [
        getSerdePlugin(config, this.serialize, this.deserialize),
        getEndpointPlugin(config, Command.getEndpointParameterInstructions()),
    ];
})
    .s("AmazonEC2", "DisassociateRouteTable", {})
    .n("EC2Client", "DisassociateRouteTableCommand")
    .f(void 0, void 0)
    .ser(se_DisassociateRouteTableCommand)
    .de(de_DisassociateRouteTableCommand)
    .build() {
}
