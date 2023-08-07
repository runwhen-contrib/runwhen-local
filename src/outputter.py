from abc import ABC, abstractmethod
from enum import Enum

from io import BytesIO
import os
from typing import AnyStr, Optional, Union
import tarfile
import time


class Outputter(ABC):
    """
    Abstract interface for handling generated file content.
    """

    @abstractmethod
    def write_file(self, path: str, data: Union[bytes, str]) -> None: ...
    @abstractmethod
    def close(self) -> None: ...


class FileSystemOutputter(Outputter):
    """
    Output method that writes file content to the local file system.
    """

    root_directory_path: AnyStr

    def __init__(self, root_directory_path: Union[bytes, str]):
        self.root_directory_path = root_directory_path

    def write_file(self, path: str, data: AnyStr) -> None:
        full_path = os.path.join(self.root_directory_path, path)
        directory_path, _ = os.path.split(full_path)
        os.makedirs(directory_path, exist_ok=True)
        mode = "wb" if type(data) == bytes else "w"
        with open(full_path, mode=mode) as f:
            f.write(data)

    def close(self):
        pass


class TarFileOutputter(Outputter):
    """
    Output method that writes file content to a tar archive.
    """
    byte_stream: Optional[BytesIO]
    tar: tarfile.TarFile
    modification_time: float

    class Compression(Enum):
        BZ2 = "bz"
        GZIP = "gz"
        LZMA = "z"

    def __init__(self, file: AnyStr = None, compression: Optional[Compression] = Compression.GZIP):
        mode = "x:" + (compression.value if compression else "")
        if file:
            self.tar = tarfile.open(file, mode)
            self.byte_stream = None
        else:
            self.byte_stream = BytesIO()
            self.tar = tarfile.open(mode=mode, fileobj=self.byte_stream)
        self.modification_time = time.time()

    def close(self):
        self.tar.close()

    def write_file(self, path: str, data: AnyStr) -> None:
        data_bytes = data if isinstance(data, bytes) else data.encode('utf-8')
        data_stream: BytesIO = BytesIO(data_bytes)
        info = tarfile.TarInfo(path)
        info.size = len(data_bytes)
        info.mtime = self.modification_time
        self.tar.addfile(info, data_stream)

    def get_bytes(self) -> bytes:
        if not self.byte_stream:
            raise Exception("get_bytes only supported for in-memory archives")
        return self.byte_stream.getvalue()


class OutputItem:
    """
    Common base class for outputted items
    """
    class Type(Enum):
        FILE = "file"
        DIRECTORY = "directory"

    type: Type

    def __init__(self, type: Type):
        self.type = type


class FileItem(OutputItem):
    """
    Item representing an outputted file
    """
    data: AnyStr

    def __init__(self, data: AnyStr):
        super().__init__(OutputItem.Type.FILE)
        self.data = data


class DirectoryItem(OutputItem):
    """
    Item representing an outputted directory
    """
    children: dict[str, OutputItem]

    def __init__(self, children: dict[str, OutputItem] = None):
        super().__init__(OutputItem.Type.DIRECTORY)
        self.children = children if children else dict()

    def add_child(self, name: str, child: OutputItem):
        self.children[name] = child


def path_to_components(path: str) -> list[str]:
    """
    Parse a file path into the list of simple file/directory names
    FIXME: This is copied from the git cache code. Ideally should refactor
    to common utility module
    """
    components = path.split("/")
    # We're always resolving paths relative to the root, so we just treat
    # absolute path the same way as relative paths, so just discard the
    # first empty path component you get if the path is absolute
    if components and components[0] == "":
        components.pop(0)
    return components


class FileItemOutputter(Outputter):

    root_item: DirectoryItem

    def __init__(self):
        self.root_item = DirectoryItem()

    def write_file(self, path: str, data: AnyStr) -> None:
        components = path_to_components(path)
        last = len(components) - 1
        parent_item = self.root_item
        for i, component in enumerate(components):
            if i == last:
                item = FileItem(data)
                parent_item.add_child(component, item)
            else:
                item = parent_item.children.get(component)
                if not item:
                    item = DirectoryItem()
                    parent_item.add_child(component, item)
                parent_item = item

    def close(self) -> None:
        pass
