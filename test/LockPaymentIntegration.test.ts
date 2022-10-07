import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers'
import { expect } from 'chai'
import { Contract, ContractFactory, Signer } from 'ethers'
import { formatEther, parseEther } from 'ethers/lib/utils'
import { ethers } from 'hardhat'

require('chai').use(require('chai-as-promised')).should()

describe('LockHolder Contracts tests', function () {
  let collection: Contract
  let lock: Contract
  let payment: Contract

  let relay: SignerWithAddress
  let owner: SignerWithAddress

  let payee1: SignerWithAddress
  let payee2: SignerWithAddress

  let user: SignerWithAddress

  this.beforeAll(async () => {
    ;[relay, owner, payee1, payee2, user] = await ethers.getSigners()

    const paymentFactory: ContractFactory = await ethers.getContractFactory('PaymentSplitter')
    payment = await paymentFactory.deploy(relay.address, owner.address)

    const sigFactory: ContractFactory = await ethers.getContractFactory('LockHolder')
    lock = await sigFactory.deploy(relay.address, owner.address, payment.address)

    const sig721Factory: ContractFactory = await ethers.getContractFactory('BridgeLandERC721')
    collection = await sig721Factory.deploy('Name', 'Symbol', 'uri', 500, relay.address, owner.address)

    const tx1 = await payment
      .connect(relay)
      .addPayees(
        collection.address,
        [payee1.address, payee2.address],
        [ethers.utils.parseEther('0.02'), ethers.utils.parseEther('0.03')]
      )
    await tx1.wait()
  })

  it('Should lock nft', async function () {
    const tx1 = await collection.connect(relay).safeMint(user.address, 'token_uri')
    const result = await tx1.wait()
    const tokenId = result.events[0].args.tokenId.toNumber()

    const tx2 = await collection.connect(user).setApprovalForAll(lock.address, true)
    await tx2.wait()

    const tx3 = await lock
      .connect(user)
      .lock(collection.address, [tokenId], 'targetCollection', 'targetOwner', { value: parseEther('0.05') })
    await tx3.wait()

    const locked = await lock.lockedBy(collection.address, tokenId)
    expect(locked).eq(user.address)

    // const [collectionBalance, acc1Balance, acc2Balance] = await Promise.all([
    //   payment.connect(relay).collectionReceived(collection.address),
    //   payment.connect(relay).accountBalance(payee1.address),
    //   payment.connect(relay).accountBalance(payee2.address)
    // ])

    // expect(formatEther(collectionBalance)).eq('0.05')
    // expect(formatEther(acc1Balance)).eq('0.02')
    // expect(formatEther(acc2Balance)).eq('0.03')
  })

  it.skip('Should lock nft second', async function () {
    const tx1 = await collection.connect(relay).safeMint(user.address, 'token_uri')
    const result = await tx1.wait()
    const tokenId = result.events[0].args.tokenId.toNumber()

    const tx2 = await collection.connect(user).setApprovalForAll(lock.address, true)
    await tx2.wait()

    const tx3 = await lock
      .connect(user)
      .lock(collection.address, [tokenId], 'targetCollection', 'targetOwner', { value: parseEther('0.05') })
    await tx3.wait()

    const locked = await lock.lockedBy(collection.address, tokenId)
    expect(locked).eq(user.address)
  })

  async function mintTokens(user: SignerWithAddress): Promise<number[]> {
    const tokens = Array.from({ length: 50 }, (_, i) => `token_uri_${i}`)
    const tx = await collection.connect(relay).safeBatchMint(user.address, tokens)
    const result = await tx.wait()
    return result.events.map(({ args }) => args.tokenId.toNumber())
  }
})
