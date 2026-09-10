import { afterEach, describe, expect, it, vi } from "vitest";
import type { BuildWriteInput } from "../types/build.types";
import {
  createOwnedBuild,
  deleteOwnedBuild,
  getOwnedBuild,
  getOwnedBuilds,
  getPublicBuild,
  getPublicBuilds,
  updateOwnedBuild,
} from "./builds.api";

const input: BuildWriteInput = {
  name: "Vagabond",
  description: "",
  visibility: "private",
  characterClassId: "vagabond",
  level: 9,
  stats: {
    vigor: 15, mind: 10, endurance: 11, strength: 14,
    dexterity: 13, intelligence: 9, faith: 9, arcane: 7,
  },
  memoryStoneCount: 0,
  spellIds: [],
  equipment: {
    weaponSlots: {
      rightHand1: null, rightHand2: null, rightHand3: null,
      leftHand1: null, leftHand2: null, leftHand3: null,
    },
    catalyst: null,
    armor: { headId: null, chestId: null, armsId: null, legsId: null },
    greatRuneId: null,
    crystalTearIds: [],
    talismanIds: [],
    buffSpellIds: [],
    weaponBuff: null,
  },
};

afterEach(() => vi.unstubAllGlobals());

describe("build persistence API", () => {
  it("serializes pagination and visibility filters for build lists", async () => {
    const fetchMock = vi.fn().mockImplementation(async () =>
      new Response(
        JSON.stringify({ status: 200, message: "Builds found", data: [] }),
        {
          status: 200,
          headers: {
            "Content-Type": "application/json",
            "X-Total-Count": "42",
          },
        },
      ));
    vi.stubGlobal("fetch", fetchMock);
    const getToken = vi.fn().mockResolvedValue("clerk-session-token");

    const publicResponse = await getPublicBuilds({ page: 2, limit: 12 });
    const ownedResponse = await getOwnedBuilds(getToken, {
      page: 3,
      limit: 10,
      visibility: "private",
    });

    expect(fetchMock).toHaveBeenNthCalledWith(
      1,
      "http://localhost:3000/api/builds?page=2&limit=12",
      expect.any(Object),
    );
    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      "http://localhost:3000/api/me/builds?page=3&limit=10&visibility=private",
      expect.any(Object),
    );
    expect(publicResponse.totalCount).toBe(42);
    expect(ownedResponse.totalCount).toBe(42);
  });

  it("loads a public build without authentication", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(
      JSON.stringify({ status: 200, message: "Build found", data: [] }),
      { status: 200, headers: { "Content-Type": "application/json" } },
    ));
    vi.stubGlobal("fetch", fetchMock);

    await getPublicBuild("build/id");

    expect(fetchMock).toHaveBeenCalledWith(
      "http://localhost:3000/api/builds/build%2Fid",
      expect.objectContaining({ headers: expect.any(Headers) }),
    );
    const options = fetchMock.mock.calls[0]?.[1] as RequestInit;
    expect(new Headers(options.headers).has("Authorization")).toBe(false);
  });

  it("loads one build only through the authenticated owner endpoint", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(
      JSON.stringify({ status: 200, message: "Build found", data: [] }),
      { status: 200, headers: { "Content-Type": "application/json" } },
    ));
    vi.stubGlobal("fetch", fetchMock);

    await getOwnedBuild("build/id", async () => "clerk-session-token");

    expect(fetchMock).toHaveBeenCalledWith(
      "http://localhost:3000/api/me/builds/build%2Fid",
      expect.objectContaining({ headers: expect.any(Headers) }),
    );
    const options = fetchMock.mock.calls[0]?.[1] as RequestInit;
    expect(new Headers(options.headers).get("Authorization")).toBe(
      "Bearer clerk-session-token",
    );
  });

  it.each([
    ["creates", createOwnedBuild, "http://localhost:3000/api/me/builds", "POST"],
    [
      "updates",
      (build: BuildWriteInput, getToken: () => Promise<string | null>) =>
        updateOwnedBuild("build/id", build, getToken),
      "http://localhost:3000/api/me/builds/build%2Fid",
      "PATCH",
    ],
  ] as const)("%s a build with a Clerk token and an allowlisted body", async (
    _case,
    requestBuild,
    expectedUrl,
    method,
  ) => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(
      JSON.stringify({ status: 200, message: "Build saved", data: [] }),
      { status: 200, headers: { "Content-Type": "application/json" } },
    ));
    vi.stubGlobal("fetch", fetchMock);

    await requestBuild(input, async () => "clerk-session-token");

    expect(fetchMock).toHaveBeenCalledWith(expectedUrl, expect.objectContaining({
      method,
      body: JSON.stringify(input),
    }));
    const options = fetchMock.mock.calls[0]?.[1] as RequestInit;
    expect(new Headers(options.headers).get("Authorization")).toBe(
      "Bearer clerk-session-token",
    );
    expect(JSON.parse(String(options.body))).not.toHaveProperty("ownerId");
    expect(JSON.parse(String(options.body))).not.toHaveProperty("gameVersion");
  });

  it("deletes only through the authenticated owner endpoint", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(
      JSON.stringify({ status: 200, message: "Build deleted", data: [] }),
      { status: 200, headers: { "Content-Type": "application/json" } },
    ));
    vi.stubGlobal("fetch", fetchMock);

    await deleteOwnedBuild("build/id", async () => "clerk-session-token");

    expect(fetchMock).toHaveBeenCalledWith(
      "http://localhost:3000/api/me/builds/build%2Fid",
      expect.objectContaining({ method: "DELETE" }),
    );
    const options = fetchMock.mock.calls[0]?.[1] as RequestInit;
    expect(new Headers(options.headers).get("Authorization")).toBe(
      "Bearer clerk-session-token",
    );
  });
});
