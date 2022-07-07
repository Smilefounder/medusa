const path = require("path")
const { SalesChannel } = require("@medusajs/medusa")

const { useApi } = require("../../../helpers/use-api")
const { useDb } = require("../../../helpers/use-db")

const adminSeeder = require("../../helpers/admin-seeder")
const { simpleSalesChannelFactory } = require("../../factories")

const startServerWithEnvironment =
  require("../../../helpers/start-server-with-environment").default

const adminReqConfig = {
  headers: {
    Authorization: "Bearer test_token",
  },
}

jest.setTimeout(50000)

describe("sales channels", () => {
  let medusaProcess
  let dbConnection

  beforeAll(async () => {
    const cwd = path.resolve(path.join(__dirname, "..", ".."))
    const [process, connection] = await startServerWithEnvironment({
      cwd,
      env: { MEDUSA_FF_SALES_CHANNELS: true },
      verbose: false,
    })
    dbConnection = connection
    medusaProcess = process
  })

  afterAll(async () => {
    const db = useDb()
    await db.shutdown()

    medusaProcess.kill()
  })

  describe("GET /admin/sales-channels/:id", () => {
    let salesChannel

    beforeEach(async () => {
      try {
        await adminSeeder(dbConnection)
        salesChannel = await simpleSalesChannelFactory(dbConnection, {
          name: "test name",
          description: "test description",
        })
      } catch (e) {
        console.error(e)
      }
    })

    afterEach(async () => {
      const db = useDb()
      await db.teardown()
    })

    it("should retrieve the requested sales channel", async () => {
      const api = useApi()
      const response = await api.get(
        `/admin/sales-channels/${salesChannel.id}`,
        adminReqConfig
      )

      expect(response.status).toEqual(200)
      expect(response.data.sales_channel).toBeTruthy()
      expect(response.data.sales_channel).toMatchSnapshot({
        id: expect.any(String),
        name: salesChannel.name,
        description: salesChannel.description,
        created_at: expect.any(String),
        updated_at: expect.any(String),
      })
    })
  })

  describe("GET /admin/sales-channels", () => {
    let salesChannel1, salesChannel2

    beforeEach(async () => {
      try {
        await adminSeeder(dbConnection)
        salesChannel1 = await simpleSalesChannelFactory(dbConnection, {
          name: "test name",
          description: "test description",
        })
        salesChannel2 = await simpleSalesChannelFactory(dbConnection, {
          name: "test name 2",
          description: "test description 2",
        })
      } catch (e) {
        console.error(e)
      }
    })

    afterEach(async () => {
      const db = useDb()
      await db.teardown()
    })

    it("should list the sales channel", async () => {
      const api = useApi()
      const response = await api.get(
        `/admin/sales-channels/`,
        adminReqConfig
      )

      expect(response.status).toEqual(200)
      expect(response.data.sales_channels).toBeTruthy()
      expect(response.data.sales_channels.length).toBe(2)
      expect(response.data).toMatchSnapshot({
        count: 2,
        limit: 20,
        offset: 0,
        sales_channels: expect.arrayContaining([
          {
            id: expect.any(String),
            name: salesChannel1.name,
            description: salesChannel1.description,
            is_disabled: false,
            deleted_at: null,
            created_at: expect.any(String),
            updated_at: expect.any(String),
          },
          {
            id: expect.any(String),
            name: salesChannel2.name,
            description: salesChannel2.description,
            is_disabled: false,
            deleted_at: null,
            created_at: expect.any(String),
            updated_at: expect.any(String),
          },
        ])
      })
    })

    it("should list the sales channel using free text search", async () => {
      const api = useApi()
      const response = await api.get(
        `/admin/sales-channels/?q=2`,
        adminReqConfig
      )

      expect(response.status).toEqual(200)
      expect(response.data.sales_channels).toBeTruthy()
      expect(response.data.sales_channels.length).toBe(1)
      expect(response.data).toMatchSnapshot({
        count: 1,
        limit: 20,
        offset: 0,
        sales_channels: expect.arrayContaining([
          {
            id: expect.any(String),
            name: salesChannel2.name,
            description: salesChannel2.description,
            is_disabled: false,
            deleted_at: null,
            created_at: expect.any(String),
            updated_at: expect.any(String),
          },
        ])
      })
    })

    it("should list the sales channel using properties filters", async () => {
      const api = useApi()
      const response = await api.get(
        `/admin/sales-channels/?name=test+name`,
        adminReqConfig
      )

      expect(response.status).toEqual(200)
      expect(response.data.sales_channels).toBeTruthy()
      expect(response.data.sales_channels.length).toBe(1)
      expect(response.data).toMatchSnapshot({
        count: 1,
        limit: 20,
        offset: 0,
        sales_channels: expect.arrayContaining([
          {
            id: expect.any(String),
            name: salesChannel1.name,
            description: salesChannel1.description,
            is_disabled: false,
            deleted_at: null,
            created_at: expect.any(String),
            updated_at: expect.any(String),
          },
        ])
      })
    })
  })

  describe("POST /admin/sales-channels/:id", () => {
    let sc

    beforeEach(async () => {
      try {
        await adminSeeder(dbConnection)
        sc = await simpleSalesChannelFactory(dbConnection, {
          name: "test name",
          description: "test description",
        })
      } catch (err) {
        console.log(err)
      }
    })

    afterEach(async () => {
      const db = useDb()
      await db.teardown()
    })

    it("updates sales channel properties", async () => {
      const api = useApi()

      const payload = {
        name: "updated name",
        description: "updated description",
        is_disabled: true,
      }

      const response = await api.post(
        `/admin/sales-channels/${sc.id}`,
        payload,
        {
          headers: {
            authorization: "Bearer test_token",
          },
        }
      )

      expect(response.status).toEqual(200)
      expect(response.data.sales_channel).toMatchSnapshot({
        id: expect.any(String),
        name: payload.name,
        description: payload.description,
        is_disabled: payload.is_disabled,
        created_at: expect.any(String),
        updated_at: expect.any(String),
      })
    })
  })


  describe("POST /admin/sales-channels", () => {
    beforeEach(async () => {
      try {
        await adminSeeder(dbConnection)
      } catch (e) {
        console.error(e)
      }
    })

    afterEach(async () => {
      const db = useDb()
      await db.teardown()
    })

    it("successfully creates a sales channel", async () => {
      const api = useApi()

      const newSalesChannel = {
        name: "sales channel name",
        description: "sales channel description",
      }

      const response = await api
        .post("/admin/sales-channels", newSalesChannel, adminReqConfig)
        .catch((err) => {
          console.log(err)
        })

      expect(response.status).toEqual(200)
      expect(response.data.sales_channel).toBeTruthy()

      expect(response.data).toMatchSnapshot({
        sales_channel: expect.objectContaining({
          name: newSalesChannel.name,
          description: newSalesChannel.description,
          is_disabled: false,
        }),
      })
    })
  })

  describe("GET /admin/sales-channels/:id", () => {})
  describe("POST /admin/sales-channels/:id", () => {})

  describe("DELETE /admin/sales-channels/:id", () => {
    let salesChannel

    beforeEach(async() => {
      try {
        await adminSeeder(dbConnection)
        salesChannel = await simpleSalesChannelFactory(dbConnection, {
          name: "test name",
          description: "test description",
        })
      } catch (e) {
        console.error(e)
      }
    })

    afterEach(async () => {
      const db = useDb()
      await db.teardown()
    })

    it("should delete the requested sales channel", async() => {
      const api = useApi()

      let deletedSalesChannel = await dbConnection.manager.findOne(SalesChannel, {
        where: { id: salesChannel.id },
        withDeleted: true
      })

      expect(deletedSalesChannel.id).toEqual(salesChannel.id)
      expect(deletedSalesChannel.deleted_at).toEqual(null)

      const response = await api.delete(
        `/admin/sales-channels/${salesChannel.id}`,
        adminReqConfig
      )

      expect(response.status).toEqual(200)
      expect(response.data).toMatchSnapshot({
        deleted: true,
        id: expect.any(String),
        object: "sales-channel",
      })

      deletedSalesChannel = await dbConnection.manager.findOne(SalesChannel, {
        where: { id: salesChannel.id },
        withDeleted: true
      })

      expect(deletedSalesChannel.id).toEqual(salesChannel.id)
      expect(deletedSalesChannel.deleted_at).not.toEqual(null)
    })

    it("should delete the requested sales channel idempotently", async() => {
      const api = useApi()

      let deletedSalesChannel = await dbConnection.manager.findOne(SalesChannel, {
        where: { id: salesChannel.id },
        withDeleted: true
      })

      expect(deletedSalesChannel.id).toEqual(salesChannel.id)
      expect(deletedSalesChannel.deleted_at).toEqual(null)

      let response = await api.delete(
        `/admin/sales-channels/${salesChannel.id}`,
        adminReqConfig
      )

      expect(response.status).toEqual(200)
      expect(response.data).toEqual({
        id: expect.any(String),
        object: "sales-channel",
        deleted: true
      })

      deletedSalesChannel = await dbConnection.manager.findOne(SalesChannel, {
        where: { id: salesChannel.id },
        withDeleted: true
      })

      expect(deletedSalesChannel.id).toEqual(salesChannel.id)
      expect(deletedSalesChannel.deleted_at).not.toEqual(null)

      response = await api.delete(
        `/admin/sales-channels/${salesChannel.id}`,
        adminReqConfig
      )

      expect(response.status).toEqual(200)
      expect(response.data).toEqual({
        id: expect.any(String),
        object: "sales-channel",
        deleted: true
      })

      deletedSalesChannel = await dbConnection.manager.findOne(SalesChannel, {
        where: { id: salesChannel.id },
        withDeleted: true
      })

      expect(deletedSalesChannel.id).toEqual(salesChannel.id)
      expect(deletedSalesChannel.deleted_at).not.toEqual(null)
    })
  })
})
