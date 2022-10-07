import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers'
import { expect } from 'chai'
import { Contract, ContractFactory, Signer } from 'ethers'
import { parseEther, formatEther } from 'ethers/lib/utils'
import { ethers } from 'hardhat'

require('chai').use(require('chai-as-promised')).should()

describe('LockHolder Contracts tests', function () {
  let paymentSplitter: Contract

  let relay: SignerWithAddress
  let owner: SignerWithAddress
  let collection: SignerWithAddress
  let collection2: SignerWithAddress
  let payee1: SignerWithAddress
  let payee2: SignerWithAddress

  this.beforeAll(async () => {
    ;[relay, owner] = await ethers.getSigners()
    ;[collection, collection2, payee1, payee2] = await ethers.getSigners()

    const sigFactory: ContractFactory = await ethers.getContractFactory('PaymentSplitter')
    paymentSplitter = await sigFactory.deploy(relay.address, owner.address)
  })

  it('Should add payee', async function () {
    const tx1 = await paymentSplitter
      .connect(relay)
      .addPayees(
        collection.address,
        [payee1.address, payee2.address],
        [ethers.utils.parseEther('10'), ethers.utils.parseEther('5')]
      )
    await tx1.wait()

    const fees = await paymentSplitter.connect(relay).getCollectionFees(collection.address)

    expect(fees[0].payee).eq(payee1.address)
    expect(ethers.utils.formatEther(fees[0].fee)).eq('10.0')
    expect(fees[1].payee).eq(payee2.address)
    expect(ethers.utils.formatEther(fees[1].fee)).eq('5.0')
  })

  it('Should change first payee', async function () {
    const tx1 = await paymentSplitter
      .connect(relay)
      .addPayees(collection.address, [payee1.address, payee2.address], [parseEther('11'), parseEther('6')])
    await tx1.wait()

    const fees = await paymentSplitter.connect(relay).getCollectionFees(collection.address)

    expect(fees[0].payee).eq(payee1.address)
    expect(formatEther(fees[0].fee)).eq('11.0')
    expect(fees[1].payee).eq(payee2.address)
    expect(formatEther(fees[1].fee)).eq('6.0')
  })

  it('Should add second payee', async function () {
    const [payee3, payee4] = await ethers.getSigners()
    const tx1 = await paymentSplitter
      .connect(relay)
      .addPayees(collection2.address, [payee3.address, payee4.address], [parseEther('2'), parseEther('3')])
    await tx1.wait()

    const fees = await paymentSplitter.connect(relay).getCollectionFees(collection2.address)

    expect(fees[0].payee).eq(payee3.address)
    expect(formatEther(fees[0].fee)).eq('2.0')
    expect(fees[1].payee).eq(payee4.address)
    expect(formatEther(fees[1].fee)).eq('3.0')
  })

  it('Should add payment', async function () {
    const [user] = await ethers.getSigners()
    const userBalance = await user.getBalance()
    const tx1 = await paymentSplitter
      .connect(relay)
      .addPayees(collection.address, [payee1.address, payee2.address], [parseEther('0.03'), parseEther('0.7')])
    await tx1.wait()

    const tx2 = await paymentSplitter.connect(user).addPayment(collection.address, 3, { value: parseEther('2.19') })
    await tx2.wait()

    const [collectionBalance, acc1Balance, acc1Released, acc2Balance, acc2Released, newUserBa] = await Promise.all([
      paymentSplitter.connect(relay).collectionReceived(collection.address),
      paymentSplitter.connect(relay).accountBalance(payee1.address),
      paymentSplitter.connect(relay).accountReleased(payee1.address),
      paymentSplitter.connect(relay).accountBalance(payee2.address),
      paymentSplitter.connect(relay).accountReleased(payee2.address),
      user.getBalance()
    ])

    expect(formatEther(collectionBalance)).eq('2.19')
    expect(newUserBa).lt(userBalance.sub(parseEther('2.19')))
    expect(formatEther(acc1Balance)).eq('0.09')
    expect(formatEther(acc1Released)).eq('0.0')
    expect(formatEther(acc2Balance)).eq('2.1')
    expect(formatEther(acc2Released)).eq('0.0')
  })
})
