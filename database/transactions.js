import mongoose from 'mongoose';

export const withTransaction = async (action) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const result = await action(session);
    await session.commitTransaction();
    return result;
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

export default withTransaction;
