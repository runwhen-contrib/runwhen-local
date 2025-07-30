import { getEndpointPlugin } from "@smithy/middleware-endpoint";
import { getSerdePlugin } from "@smithy/middleware-serde";
import { Command as $Command } from "@smithy/smithy-client";
import { commonParams } from "../endpoint/EndpointParameters";
import { de_ModifyCertificatesCommand, se_ModifyCertificatesCommand } from "../protocols/Aws_query";
export { $Command };
export class ModifyCertificatesCommand extends $Command
    .classBuilder()
    .ep(commonParams)
    .m(function (Command, cs, config, o) {
    return [
        getSerdePlugin(config, this.serialize, this.deserialize),
        getEndpointPlugin(config, Command.getEndpointParameterInstructions()),
    ];
})
    .s("AmazonRDSv19", "ModifyCertificates", {})
    .n("RDSClient", "ModifyCertificatesCommand")
    .f(void 0, void 0)
    .ser(se_ModifyCertificatesCommand)
    .de(de_ModifyCertificatesCommand)
    .build() {
}
