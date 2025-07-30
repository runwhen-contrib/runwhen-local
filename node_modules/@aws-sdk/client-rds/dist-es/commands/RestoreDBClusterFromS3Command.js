import { getEndpointPlugin } from "@smithy/middleware-endpoint";
import { getSerdePlugin } from "@smithy/middleware-serde";
import { Command as $Command } from "@smithy/smithy-client";
import { commonParams } from "../endpoint/EndpointParameters";
import { de_RestoreDBClusterFromS3Command, se_RestoreDBClusterFromS3Command } from "../protocols/Aws_query";
export { $Command };
export class RestoreDBClusterFromS3Command extends $Command
    .classBuilder()
    .ep(commonParams)
    .m(function (Command, cs, config, o) {
    return [
        getSerdePlugin(config, this.serialize, this.deserialize),
        getEndpointPlugin(config, Command.getEndpointParameterInstructions()),
    ];
})
    .s("AmazonRDSv19", "RestoreDBClusterFromS3", {})
    .n("RDSClient", "RestoreDBClusterFromS3Command")
    .f(void 0, void 0)
    .ser(se_RestoreDBClusterFromS3Command)
    .de(de_RestoreDBClusterFromS3Command)
    .build() {
}
