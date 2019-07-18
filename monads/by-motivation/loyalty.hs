import Control.Monad.State

data Loyalty = Card Int deriving Show

stamp (Card n)
  | stamped < 10 = ("You have " ++ (show stamped) ++ " stamps", Card stamped)
  | otherwise    = ("You have earned a free beverage", Card 0)
    where
      stamped = n+1

stampTwice c =
  ([msg1, msg2], card)
    where
      (msg1, tmp) = stamp c
      (msg2, card) = stamp tmp

composeState :: (c -> (b, d)) -> (a -> (b, c)) -> (a -> ([b], d))
composeState f g x =
  ([r1,r2], state)
    where
      (r1, tmp) = g x
      (r2, state) = f tmp

stampm :: State Loyalty String
stampm = do
  card <- get
  let (msg, next) = stamp card
  put next
  return msg
