import ItemComponent from '../components/Item'
import {shallow} from 'enzyme'
import toJSON from 'enzyme-to-json'

const fakeItem = {
  id: 'ABC123',
  title: 'A Cool Item',
  price: 5000,
  description: 'This item is really cool!',
  image: 'dog.jpg',
  largImage: 'largedog.jpg'
}

describe('<Item />', () => {
  it('renders and matches the snapshot', () => {
    const wrapper = shallow(<ItemComponent item={fakeItem} />)
    expect(toJSON(wrapper)).toMatchSnapshot()
  })
  // it('renders the image properly', () => {
  //   const wrapper = shallow(<ItemComponent item={fakeItem} />)
  //   const img = wrapper.find('img')
  //   expect(img.props().src).toEqual(fakeItem.image)
  //   expect(img.props().alt).toEqual(fakeItem.title)
  // })

  // it('renders and displays properly', () => {
  //   const wrapper = shallow(<ItemComponent item={fakeItem} />)
  //   const PriceTag = wrapper.find('PriceTag')
  //   expect(PriceTag.children().text()).toEqual('$50')
  //   expect(wrapper.find('Title a').text()).toBe(fakeItem.title)
  // })

  // it('renders out the buttons properly', () => {
  //   const wrapper = shallow(<ItemComponent item={fakeItem} />)
  //   const ButtonList = wrapper.find('.buttonList')
  //   expect(ButtonList.children()).toHaveLength(3)
  //   expect(ButtonList.find('Link').exists()).toBe(true)
  //   expect(ButtonList.find('AddToCart').exists()).toBe(true)
  //   expect(ButtonList.find('DeleteItem').exists()).toBe(true)
  // })
})
