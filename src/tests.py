from io import BytesIO
import os
import tempfile
import tarfile

from name_utils import make_qualified_slx_name, make_slx_name, shorten_name
from unittest import TestCase
from outputter import *

class OutputterTest(TestCase):

    TEST_FILES = (
        ("top.txt", "top"),
        ("a/b/foo.txt", "foo"),
        ("a/bar.txt", "bar"),
        ("a/b/c/test.txt", "test"),
    )

    def setUp(self):
        self.output_dir = tempfile.TemporaryDirectory()

    def tearDown(self):
        self.output_dir.cleanup()

    def common_write_files(self, outputter: Outputter):
        for path, data in OutputterTest.TEST_FILES:
            outputter.write_file(path, data)

    def common_check_output(self, get_data_func):
        # FIXME: This validation of the output isn't perfect, because it
        # only checks that the expected files were included in the output,
        # but doesn't check that there were no other unexpected files.
        for path, expected_data in OutputterTest.TEST_FILES:
            data = get_data_func(path)
            self.assertEqual(expected_data, data)

    def test_file_system_outputter(self):
        outputter = FileSystemOutputter(self.output_dir.name)
        self.common_write_files(outputter)
        outputter.close()
        def get_data(path):
            full_path = os.path.join(self.output_dir.name, path)
            with open(full_path, "r") as f:
                return f.read()
        self.common_check_output(get_data)

    def test_tar_file_outputter(self):
        outputter = TarFileOutputter()
        self.common_write_files(outputter)
        outputter.close()
        tar_bytes = outputter.get_bytes()
        tar_stream = BytesIO(tar_bytes)
        tar = tarfile.open(fileobj=tar_stream)
        def get_data(path):
            member = tar.getmember(path)
            self.assertEqual(tarfile.REGTYPE, member.type)
            output = tar.extractfile(member)
            data_bytes = output.read()
            data = data_bytes.decode('utf-8')
            return data
        self.common_check_output(get_data)

    def test_file_item_outputter(self):
        outputter = FileItemOutputter()
        self.common_write_files(outputter)
        outputter.close()
        root_item = outputter.root_item
        # tar_bytes = outputter.get_bytes()
        # tar_stream = BytesIO(tar_bytes)
        # tar = tarfile.open(fileobj=tar_stream)
        def get_data(path):
            components = path_to_components(path)
            item = root_item
            for component in components:
                item = item.children[component]
            self.assertIsInstance(item, FileItem)
            return item.data
        self.common_check_output(get_data)


class NameUtilsTest(TestCase):
    def test_qualifier_with_underscore(self):
        qualifiers = ["my_cl", "dev_ns"]
        qualified_slx_name = make_qualified_slx_name("test", qualifiers)
        self.assertEqual("my-cl-dev-ns-test", qualified_slx_name)
        slx_name = make_slx_name("my-workspace", qualified_slx_name)
        self.assertEqual("my-workspace--my-cl-dev-ns-test", slx_name)
        qualified_slx_name = make_qualified_slx_name("statefulset-health", ["argo-cd-argocd-application-controller"])
        self.assertEqual("acaa-statefulset-health", qualified_slx_name)
        shortened_base_name = shorten_name("statefulset-health", 15)
        self.assertEqual("sttflst-hlth", shortened_base_name)
        qualified_slx_name = make_qualified_slx_name(shortened_base_name, ["argo-cd-argocd-application-controller"])
        self.assertEqual("acaac-sttflst-hlth", qualified_slx_name)

