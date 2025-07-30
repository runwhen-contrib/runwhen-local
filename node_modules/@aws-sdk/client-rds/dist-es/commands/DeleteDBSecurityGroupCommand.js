import { getEndpointPlugin } from "@smithy/middleware-endpoint";
import { getSerdePlugin } from "@smithy/middleware-serde";
import { Command as $Command } from "@smithy/smithy-client";
import { commonParams } from "../endpoint/EndpointParameters";
import { de_DeleteDBSecurityGroupCommand, se_DeleteDBSecurityGroupCommand } from "../protocols/Aws_query";
export { $Command };
export class DeleteDBSecurityGroupCommand extends $Command
    .classBuilder()
    .ep(commonParams)
    .m(function (Command, cs, config, o) {
    return [
        getSerdePlugin(config, this.serialize, this.deserialize),
        getEndpointPlugin(config, Command.getEndpointParameterInstructions()),
    ];
})
    .s("AmazonRDSv19", "DeleteDBSecurityGroup", {})
    .n("RDSClient", "DeleteDBSecurityGroupCommand")
    .f(void 0, void 0)
    .ser(se_DeleteDBSecurityGroupCommand)
    .de(de_DeleteDBSecurityGroupCommand)
    .build() {
}
