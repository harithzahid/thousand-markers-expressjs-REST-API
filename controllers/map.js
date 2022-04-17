import asyncHandler from 'express-async-handler';
import booleanPointInPolygon from '@turf/boolean-point-in-polygon';
import { point } from '@turf/helpers';

import User from '../models/user.js';
import { USER_TYPE } from '../utils/constants.js';
import { getPolygonBetweenTwoPoints } from '../utils/index.js';

const getMarkers = asyncHandler(async (req, res) => {
  try {
    const { user: userType, sw, ne } = req.query;
    const currentBounds = [ne.split(','), sw.split(',')];
    const poly = getPolygonBetweenTwoPoints(currentBounds);
    const infoPath = userType === USER_TYPE.OWNER ? 'projectInfo' : 'contractorInfo';
    const coordinatesPath = infoPath + '.coordinates';
    const users = await User.aggregate([
      { $match: { type: userType }},
      { $project: { id: '$_id', coordinates: '$' + coordinatesPath } }
    ])
    const selectedUsers = users.filter((item) => {
      const { coordinates } = item;
      return booleanPointInPolygon(
        point([coordinates[0], coordinates[1]]),
        poly
      )
    });

    if (selectedUsers) {
      res.status(200).send(selectedUsers);
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
});

export {
  getMarkers
};
