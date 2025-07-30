import { getEndpointPlugin } from "@smithy/middleware-endpoint";
import { getSerdePlugin } from "@smithy/middleware-serde";
import { Command as $Command } from "@smithy/smithy-client";
import { commonParams } from "../endpoint/EndpointParameters";
import { de_RegisterDBProxyTargetsCommand, se_RegisterDBProxyTargetsCommand } from "../protocols/Aws_query";
export { $Command };
export class RegisterDBProxyTargetsCommand extends $Command
    .classBuilder()
    .ep(commonParams)
    .m(function (Command, cs, config, o) {
    return [
        getSerdePlugin(config, this.serialize, this.deserialize),
        getEndpointPlugin(config, Command.getEndpointParameterInstructions()),
    ];
})
    .s("AmazonRDSv19", "RegisterDBProxyTargets", {})
    .n("RDSClient", "RegisterDBProxyTargetsCommand")
    .f(void 0, void 0)
    .ser(se_RegisterDBProxyTargetsCommand)
    .de(de_RegisterDBProxyTargetsCommand)
    .build() {
}
