import { getEndpointPlugin } from "@smithy/middleware-endpoint";
import { getSerdePlugin } from "@smithy/middleware-serde";
import { Command as $Command } from "@smithy/smithy-client";
import { commonParams } from "../endpoint/EndpointParameters";
import { de_DeleteClientVpnRouteCommand, se_DeleteClientVpnRouteCommand } from "../protocols/Aws_ec2";
export { $Command };
export class DeleteClientVpnRouteCommand extends $Command
    .classBuilder()
    .ep(commonParams)
    .m(function (Command, cs, config, o) {
    return [
        getSerdePlugin(config, this.serialize, this.deserialize),
        getEndpointPlugin(config, Command.getEndpointParameterInstructions()),
    ];
})
    .s("AmazonEC2", "DeleteClientVpnRoute", {})
    .n("EC2Client", "DeleteClientVpnRouteCommand")
    .f(void 0, void 0)
    .ser(se_DeleteClientVpnRouteCommand)
    .de(de_DeleteClientVpnRouteCommand)
    .build() {
}
