import asyncHandler from 'express-async-handler';
import booleanPointInPolygon from '@turf/boolean-point-in-polygon';
import { randomPoint } from '@turf/random';
import { point } from '@turf/helpers';
import fetch from 'node-fetch';
import _ from 'lodash';

import User from '../models/user.js';
import { JOB, USER_TYPE } from '../utils/constants.js';
import { randomDate, loremIpsum, getRandomValues, getPolygonBetweenTwoPoints } from '../utils/index.js';

const getUser = asyncHandler(async (req, res) => {
  try {
    const { id } = req.query;
    const user = await User.findOne({ _id: id });

    if (id) {
      res.status(200).send(user);
    } else {
      res.status(500);
      throw new Error(
        `Internal Server Error. Unable to retrieve users. Please try again later.`
      );
    }

  } catch (error) {
    res.status(500);
    throw new Error(
      `Internal Server Error. Unable to retrieve users due to this following errors: ${error}`
    );
  }
})

const getUsers = asyncHandler(async (req, res) => {
  try {
    const { user: userType, sw, ne, page=2 } = req.query;
    const currentBounds = [ne.split(','), sw.split(',')];
    const poly = getPolygonBetweenTwoPoints(currentBounds);
    const infoPath = userType === USER_TYPE.OWNER ? 'projectInfo' : 'contractorInfo';
    const users = await User.find({ type: userType });
    const selectedUsers = users.filter((item) => {
      const coordinates = item[infoPath].coordinates;
      return booleanPointInPolygon(
        point([coordinates[0], coordinates[1]]),
        poly
      )
    });

    const options = {
      page: page,
      limit: 10,
    };

    const selectedIds = selectedUsers.map((item) => ({ _id: item._id }));
    await User.paginate({ type: userType, $or: selectedIds }, options, function (err, result) {
        if (selectedUsers) {
          res.status(200).send(result);
        } else {
          res.status(500);
          throw new Error(
            `Internal Server Error. Unable to retrieve users. Please try again later. ${err}`
          );
        }
    });

  } catch (error) {
    res.status(500);
    throw new Error(
      `Internal Server Error. Unable to retrieve users due to this following errors: ${error}`
    );
  }
})

const generateFakeUsers = asyncHandler(async (bbox) => {
  try {
    const numberOfUsers = 10;
    const userType = USER_TYPE.OWNER;
    const randomCoords = randomPoint(numberOfUsers, { bbox });
    const users = await fetch(`https://randomuser.me/api/?results=${numberOfUsers}&nat=us`);
    const usersText = await users.text();
    const usersJSON = JSON.parse(usersText).results;

    const generateUsers = randomCoords.features?.map(async (item, index) => {
      const address = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/` +
        `${item.geometry.coordinates[0]},${item.geometry.coordinates[1]}.json` +
        `?access_token=${process.env.MAPBOX_PUBLIC_TOKEN}`
      );
      const addressText = await address.text();
      const addressJSON = JSON.parse(addressText);
      const addressContext = _.get(addressJSON, 'features[0].context') || [];
      const geocodingAddress = addressContext.reduce(
        (total, current) => {
          return {
            ...total,
            [current.id.split('.')[0]]: current.text,
          };
        },
        {}
      );
      const user = usersJSON[index];
      const skills = getRandomValues(Object.values(JOB));
      const legitAddress =
        geocodingAddress.district
        && geocodingAddress.place
        && geocodingAddress.postcode
        && geocodingAddress.region
        && geocodingAddress.country
      if (userType === USER_TYPE.CONTRACTOR && legitAddress) {
        const newUser = await new User({
          name: user.name.first + ' ' + user.name.last,
          type: USER_TYPE.CONTRACTOR,
          contractorInfo: {
            picture: user.picture.large,
            intro: 'Just another contractor',
            address: {
              street_address: geocodingAddress.district,
              city: geocodingAddress.place,
              zipcode: geocodingAddress.postcode,
              state: geocodingAddress.region,
              country: geocodingAddress.country,
            },
            coordinates: item.geometry.coordinates,
            skills
          }
        })
        return newUser
      } else if (legitAddress) {
        const newUser = await new User({
          name: user.name.first + ' ' + user.name.last,
          type: USER_TYPE.OWNER,
          projectInfo: {
            title: 'Need helps moving stuff.',
            description: loremIpsum,
            address: {
              street_address: geocodingAddress.district,
              city: geocodingAddress.place,
              zipcode: geocodingAddress.postcode,
              state: geocodingAddress.region,
              country: geocodingAddress.country,
            },
            coordinates: item.geometry.coordinates,
            budget: 100,
            startDate: randomDate(new Date(), new Date(2022, 5, 5))
          }
        })
        return newUser
      }
      return null;
    })

    const generatedUsers = await Promise.all(generateUsers);
    const legitUsers = generatedUsers.filter((item) => item);
    User.insertMany(legitUsers)
      .then(function(){
          console.log("Data inserted")
      })
  } catch (error) {
    throw new Error(
      `Internal Server Error. Unable to retrieve users due to this following errors: ${error}`
    );
  }
});

export {
  getUser,
  getUsers
};
