export interface BrowserDocumentFileHandle {
  readonly name?: string;

  createWritable(): Promise<{
    write(data: string): Promise<void>;
    close(): Promise<void>;
  }>;

  getFile(): Promise<File>;
}

interface FilePickerType {
  description: string;
  accept: Record<string, string[]>;
}

interface SaveFilePickerOptions {
  suggestedName?: string;
  types?: FilePickerType[];
}

interface OpenFilePickerOptions {
  multiple?: boolean;
  types?: FilePickerType[];
}

interface FileSystemAccessWindow extends Window {
  showSaveFilePicker(
    options?: SaveFilePickerOptions
  ): Promise<BrowserDocumentFileHandle>;

  showOpenFilePicker(
    options?: OpenFilePickerOptions
  ): Promise<BrowserDocumentFileHandle[]>;
}

export type SaveDocumentFileResult =
  | {
      ok: true;
      handle: BrowserDocumentFileHandle;
      fileName: string;
    }
  | {
      ok: false;
      reason: "FILE_SYSTEM_ACCESS_UNAVAILABLE";
    };

export type OpenDocumentFileResult =
  | {
      ok: true;
      handle: BrowserDocumentFileHandle;
      fileName: string;
      text: string;
    }
  | {
      ok: false;
      reason: "FILE_SYSTEM_ACCESS_UNAVAILABLE";
    };

const TYPESET_FILE_TYPES: FilePickerType[] = [
  {
    description: "TypeSet Document",
    accept: {
      "application/json": [".typeset"],
    },
  },
];

function getFileSystemAccessWindow(): FileSystemAccessWindow | null {
  if (typeof window === "undefined") {
    return null;
  }

  const candidate = window as Partial<FileSystemAccessWindow>;

  if (
    typeof candidate.showSaveFilePicker !== "function" ||
    typeof candidate.showOpenFilePicker !== "function"
  ) {
    return null;
  }

  return window as unknown as FileSystemAccessWindow;
}

export async function saveDocumentFile({
  text,
  suggestedName,
  existingHandle = null,
}: {
  text: string;
  suggestedName: string;
  existingHandle?: BrowserDocumentFileHandle | null;
}): Promise<SaveDocumentFileResult> {
  const fileSystemWindow = getFileSystemAccessWindow();

  if (!fileSystemWindow) {
    return {
      ok: false,
      reason: "FILE_SYSTEM_ACCESS_UNAVAILABLE",
    };
  }

  const handle =
    existingHandle ??
    (await fileSystemWindow.showSaveFilePicker({
      suggestedName: suggestedName || "document.typeset",
      types: TYPESET_FILE_TYPES,
    }));

  const writable = await handle.createWritable();
  await writable.write(text);
  await writable.close();

  return {
    ok: true,
    handle,
    fileName: handle.name || suggestedName || "document.typeset",
  };
}

export async function openDocumentFile(): Promise<OpenDocumentFileResult> {
  const fileSystemWindow = getFileSystemAccessWindow();

  if (!fileSystemWindow) {
    return {
      ok: false,
      reason: "FILE_SYSTEM_ACCESS_UNAVAILABLE",
    };
  }

  const [handle] = await fileSystemWindow.showOpenFilePicker({
    multiple: false,
    types: TYPESET_FILE_TYPES,
  });

  const file = await handle.getFile();

  return {
    ok: true,
    handle,
    fileName: file.name,
    text: await file.text(),
  };
}