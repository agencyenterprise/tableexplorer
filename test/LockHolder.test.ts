import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers'
import { expect } from 'chai'
import { Contract, ContractFactory, Signer } from 'ethers'
import { parseEther } from 'ethers/lib/utils'
import { ethers } from 'hardhat'

require('chai').use(require('chai-as-promised')).should()

describe.skip('LockHolder Contracts tests', function () {
  let collection: Contract
  let lock: Contract
  let payment: Contract

  let relay: SignerWithAddress
  let owner: SignerWithAddress

  this.beforeAll(async () => {
    ;[relay, owner] = await ethers.getSigners()

    const paymentFactory: ContractFactory = await ethers.getContractFactory('PaymentSplitter')
    payment = await paymentFactory.deploy(relay.address, owner.address)

    const sigFactory: ContractFactory = await ethers.getContractFactory('LockHolder')
    lock = await sigFactory.deploy(relay.address, owner.address, payment.address)

    const sig721Factory: ContractFactory = await ethers.getContractFactory('BridgeLandERC721')
    collection = await sig721Factory.deploy('Name', 'Symbol', 'uri', 500, relay.address, owner.address)
  })

  it('Should lock nft', async function () {
    const [user] = await ethers.getSigners()
    const tx1 = await collection.connect(relay).safeMint(user.address, 'token_uri')
    const result = await tx1.wait()
    const tokenId = result.events[0].args.tokenId.toNumber()

    const tx2 = await collection.connect(user).setApprovalForAll(lock.address, true)
    await tx2.wait()

    const tx3 = await lock.connect(user).lock(collection.address, [tokenId], 'targetCollection', 'targetOwner')
    await tx3.wait()

    const locked = await lock.lockedBy(collection.address, tokenId)
    expect(locked).eq(user.address)
  })

  it('Should lock 250 nft', async function () {
    const [user] = await ethers.getSigners()

    const tokenIds = await Promise.all([mintTokens(user), mintTokens(user), mintTokens(user), mintTokens(user), mintTokens(user)])

    const tx2 = await collection.connect(user).setApprovalForAll(lock.address, true)
    await tx2.wait()

    const tx3 = await lock.connect(user).lock(collection.address, tokenIds.flat(), 'targetCollection', 'targetOwner')
    await tx3.wait()

    const locks = await Promise.all(tokenIds.flat().map(token => lock.lockedBy(collection.address, token)))
    for (const locked of locks) {
      expect(locked).eq(user.address)
    }
  })

  async function mintTokens(user: SignerWithAddress): Promise<number[]> {
    const tokens = Array.from({ length: 50 }, (_, i) => `token_uri_${i}`)
    const tx = await collection.connect(relay).safeBatchMint(user.address, tokens)
    const result = await tx.wait()
    return result.events.map(({ args }) => args.tokenId.toNumber())
  }
})
