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
    const users = await User.find({ type: userType }, `id, ${coordinatesPath}`);
    const selectedUsers = users.filter((item) => {
      const coordinates = item[infoPath].coordinates;
      return booleanPointInPolygon(
        point([coordinates[0], coordinates[1]]),
        poly
      )
    });

    const trimmedSelectedUsers = selectedUsers.map((item) => ({
      id: item.id,
      coordinates: item[infoPath].coordinates
    }))

    if (selectedUsers) {
      res.status(200).send(trimmedSelectedUsers);
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
