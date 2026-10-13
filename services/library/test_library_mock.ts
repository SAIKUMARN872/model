import test from "node:test";
import assert from "node:assert/strict";

import {
  FileRepository,
  FolderRepository,
  LibraryRepository,
  FileService,
  FolderService,
  SearchService,
  LibraryService,
  FileController,
  FolderController,
  SearchController,
  LibraryController,
  LibraryEventBus,
  validateCreateFile,
  validateCreateFolder,
  validateSearchInput,
} from "./index.js";

test("file schema validates and normalizes input", () => {
  const result = validateCreateFile({
    name: "  report.txt  ",
    path: " /docs/report.txt ",
    size: 10,
  });

  assert.equal(result.name, "report.txt");
  assert.equal(result.path, "/docs/report.txt");
  assert.equal(result.size, 10);
  assert.equal(result.mimeType, "application/octet-stream");
});

test("file schema rejects empty name, empty path and invalid size", () => {
  assert.throws(() => validateCreateFile({ name: "", path: "/a" }), /name/i);
  assert.throws(() => validateCreateFile({ name: "a.txt", path: " " }), /path/i);
  assert.throws(() => validateCreateFile({ name: "a.txt", path: "/a", size: -1 }), /size/i);
});

test("folder schema validates and normalizes input", () => {
  assert.deepEqual(validateCreateFolder({ name: "  Reports  " }), { name: "Reports" });
  assert.throws(() => validateCreateFolder({ name: " " }), /name/i);
});

test("search schema applies defaults and rejects invalid limits", () => {
  const result = validateSearchInput({ query: "  report " });
  assert.equal(result.query, "report");
  assert.equal(result.limit, 20);

  assert.throws(() => validateSearchInput({ query: "" }), /query/i);
  assert.throws(() => validateSearchInput({ query: "report", limit: 0 }), /limit/i);
  assert.throws(() => validateSearchInput({ query: "report", limit: 101 }), /limit/i);
});

test("file repository creates, retrieves, lists, updates and deletes files", () => {
  const repo = new FileRepository();
  const file = repo.create({
    name: "report.txt",
    path: "/docs/report.txt",
    size: 100,
  });

  assert.ok(file.id);
  assert.equal(repo.getById(file.id)?.name, "report.txt");
  assert.equal(repo.list().length, 1);

  const updated = repo.update(file.id, { name: "updated.txt" });
  assert.equal(updated.name, "updated.txt");
  assert.equal(repo.getById(file.id)?.name, "updated.txt");

  assert.equal(repo.delete(file.id), true);
  assert.equal(repo.getById(file.id), undefined);
  assert.equal(repo.delete(file.id), false);
});

test("file repository rejects updates to missing files", () => {
  const repo = new FileRepository();
  assert.throws(() => repo.update("missing", { name: "new.txt" }), /not found/i);
});

test("repository returns defensive copies", () => {
  const repo = new FileRepository();
  const file = repo.create({
    name: "report.txt",
    path: "/report.txt",
    metadata: { category: "docs" },
  });

  file.metadata.category = "changed";
  assert.equal(repo.getById(file.id)?.metadata.category, "docs");

  const fetched = repo.getById(file.id)!;
  fetched.metadata.category = "also changed";
  assert.equal(repo.getById(file.id)?.metadata.category, "docs");
});

test("folder repository supports parent-child folders", () => {
  const repo = new FolderRepository();
  const parent = repo.create({ name: "Documents" });
  const child = repo.create({ name: "Reports", parentId: parent.id });

  assert.equal(repo.getById(child.id)?.parentId, parent.id);
  assert.equal(repo.list(parent.id).length, 1);
  assert.throws(() => repo.create({ name: "Invalid", parentId: "missing" }), /parent folder not found/i);
});

test("folder repository prevents deleting folders with subfolders", () => {
  const repo = new FolderRepository();
  const parent = repo.create({ name: "Parent" });
  repo.create({ name: "Child", parentId: parent.id });

  assert.throws(() => repo.delete(parent.id), /subfolders/i);
});

test("folder repository rejects self-parenting", () => {
  const repo = new FolderRepository();
  const folder = repo.create({ name: "Folder" });

  assert.throws(() => repo.update(folder.id, { parentId: folder.id }), /own parent/i);
});

test("library repository prevents deleting folders that contain files", () => {
  const repo = new LibraryRepository();
  const folder = repo.folders.create({ name: "Documents" });
  repo.files.create({
    name: "report.txt",
    path: "/report.txt",
    folderId: folder.id,
  });

  assert.throws(() => repo.deleteFolder(folder.id), /contains files/i);
});

test("file service performs CRUD operations", () => {
  const service = new FileService();
  const file = service.create({ name: "a.txt", path: "/a.txt" });

  assert.equal(service.get(file.id).name, "a.txt");
  assert.equal(service.list().length, 1);
  assert.equal(service.update(file.id, { name: "b.txt" }).name, "b.txt");
  assert.equal(service.delete(file.id), true);
  assert.throws(() => service.get(file.id), /not found/i);
});

test("folder service performs CRUD operations", () => {
  const service = new FolderService();
  const folder = service.create({ name: "Documents" });

  assert.equal(service.get(folder.id).name, "Documents");
  assert.equal(service.list().length, 1);
  assert.equal(service.update(folder.id, { name: "Archive" }).name, "Archive");
  assert.equal(service.delete(folder.id), true);
  assert.throws(() => service.get(folder.id), /not found/i);
});

test("search service finds files by name, path and MIME type", () => {
  const repo = new FileRepository();
  repo.create({ name: "Quarterly Report.txt", path: "/docs/q1.txt" });
  repo.create({ name: "image.png", path: "/images/report.png", mimeType: "image/png" });
  repo.create({ name: "notes.txt", path: "/docs/notes.txt" });

  const search = new SearchService(repo);

  assert.equal(search.search({ query: "quarterly" }).length, 1);
  assert.equal(search.search({ query: "/images" }).length, 1);
  assert.equal(search.search({ query: "image/png" }).length, 1);
  assert.equal(search.search({ query: "not-found" }).length, 0);
});

test("search service respects folder filters and result limits", () => {
  const repo = new FileRepository();
  const folder = new FolderRepository().create({ name: "Docs" });

  repo.create({ name: "report-one.txt", path: "/1", folderId: folder.id });
  repo.create({ name: "report-two.txt", path: "/2", folderId: folder.id });
  repo.create({ name: "report-three.txt", path: "/3" });

  const search = new SearchService(repo);

  assert.equal(search.search({ query: "report", folderId: folder.id }).length, 2);
  assert.equal(search.search({ query: "report", limit: 1 }).length, 1);
});

test("library service shares repositories between its services", () => {
  const library = new LibraryService();
  const folder = library.createFolder({ name: "Documents" });
  const file = library.createFile({
    name: "report.txt",
    path: "/documents/report.txt",
    folderId: folder.id,
  });

  assert.equal(library.files.get(file.id).folderId, folder.id);
  assert.equal(library.search.search({ query: "report" }).length, 1);
  assert.throws(() => library.deleteFolder(folder.id), /contains files/i);
});

test("library service rejects file creation in a missing folder", () => {
  const library = new LibraryService();

  assert.throws(
    () => library.createFile({
      name: "report.txt",
      path: "/report.txt",
      folderId: "missing",
    }),
    /folder not found/i,
  );
});

test("library event bus publishes events and supports unsubscribe", () => {
  const bus = new LibraryEventBus();
  const received: string[] = [];

  const unsubscribe = bus.subscribe(event => received.push(event.type));

  bus.publish({
    type: "file.created",
    file: {
      id: "f1",
      name: "a.txt",
      path: "/a.txt",
      mimeType: "text/plain",
      size: 1,
      metadata: {},
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  });

  unsubscribe();
  bus.publish({ type: "file.deleted", fileId: "f1" });

  assert.deepEqual(received, ["file.created"]);
});

test("file controller delegates file operations", () => {
  const library = new LibraryService();
  const controller = new FileController(library);

  const file = controller.create({ name: "a.txt", path: "/a.txt" });

  assert.equal(controller.get(file.id).name, "a.txt");
  assert.equal(controller.list().length, 1);
  assert.equal(controller.update(file.id, { name: "b.txt" }).name, "b.txt");
  assert.equal(controller.delete(file.id), true);
});

test("folder controller delegates folder operations", () => {
  const library = new LibraryService();
  const controller = new FolderController(library);

  const folder = controller.create({ name: "Docs" });

  assert.equal(controller.get(folder.id).name, "Docs");
  assert.equal(controller.list().length, 1);
  assert.equal(controller.update(folder.id, { name: "Archive" }).name, "Archive");
  assert.equal(controller.delete(folder.id), true);
});

test("search controller searches files created in its library", () => {
  const library = new LibraryService();
  library.createFile({ name: "project.txt", path: "/project.txt" });

  const controller = new SearchController(library);

  assert.equal(controller.search({ query: "project" }).length, 1);
});

test("library controller supports integrated operations", () => {
  const controller = new LibraryController();

  const folder = controller.createFolder({ name: "Work" });
  controller.createFile({
    name: "work-report.txt",
    path: "/work/report.txt",
    folderId: folder.id,
  });

  assert.equal(controller.search({ query: "work-report" }).length, 1);
  assert.throws(() => controller.deleteFolder(folder.id), /contains files/i);
});

test("folder deletion succeeds after contained files are deleted", () => {
  const library = new LibraryService();
  const folder = library.createFolder({ name: "Temporary" });
  const file = library.createFile({
    name: "temp.txt",
    path: "/temp.txt",
    folderId: folder.id,
  });

  assert.equal(library.files.delete(file.id), true);
  assert.equal(library.deleteFolder(folder.id), true);
});

