A fairly minimal setup has a configuration, stage and cleanup
Does the version number change?

	configure // create the card under test
		data Multiplier m

Test that the card correctly initialized the value
		
	test that m was initialized
		assert (m.value)
			42
	
	test we can multiply by 10
		contract m HitMe hit
		assert (m.value)
			420
			
	test we can multiply again because we run stages in order
		contract m HitMe hit
		assert (m.value)
			4200
	